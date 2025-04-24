"use client";

import {Button, Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check auth state
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">Todo App</p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          {user ? `Welcome, ${user.user_metadata.displayName}` : "Not logged in"}
        </NavbarItem>
        {user && (
          <NavbarItem>
            <form onSubmit={(e) => { e.preventDefault(); handleSignOut(); }}>
              <Button color="primary" variant="flat" type="submit">
                Sign Out
              </Button>
            </form>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
