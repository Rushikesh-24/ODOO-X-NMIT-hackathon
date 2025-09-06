"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const createUser = useMutation(api.database.createUser);
  const checkUser = useQuery(api.database.getUserById, { userId: user?.id || "" });

  useEffect(() => {
    if (!isSignedIn || !user || checkUser === undefined) return;
    if (!checkUser) {
      console.log("Creating new user:", user.id);
      createUser({
        userId: user.id,
        userName: user.username || "",
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || "",
        profileImageUrl: user.imageUrl || "",
      });
    }
  }, [isSignedIn, user, checkUser, createUser]);

  return <div></div>;
}