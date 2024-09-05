import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";

export const authOptions : NextAuthOptions = {
  providers:[
      CredentialsProvider({
          id:"crendeitals",
          name:"Crentials",

          credentials:{
              email: { label: 'Email', type: 'text' },
              username: { label: "Username", type: "text", placeholder: "jsmith" },
              password: { label: "Password", type: "password" }
          },

          async authorize(credentials, req): Promise<any>{
             
              await dbConnect()

              try {
                  const user = await UserModel.findOne({
                    $or: [
                      { email: credentials?.email },
                      { username: credentials?.password },
                    ],
                  });
                  if (!user) {
                    throw new Error('No user found with this email');
                  }
                  if (!user.isVerified) {
                    throw new Error('Please verify your account before logging in');
                  }

                  const isPasswordCorrect = await bcrypt.compare(credentials?.password || "",user.password);
                  if (isPasswordCorrect) {
                    return user;
                  } else {
                    throw new Error('Incorrect password');
                  }
                } catch (err: any) {
                  throw new Error(err);
                }
             
          },
      })
  ],

  pages:{
      signIn:"sign-in"
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  session:{
      strategy:"jwt"
  },

  callbacks:{
      async session({ session, user }) {

          if(user){
              session.user._id = user._id?.toString();
              session.user.username = user.username;
              session.user.isVerified = user.isVerified;
              session.user.isAcceptingMessages = user.isAcceptingMessages;

          }

          return session
        },

      async jwt({ token, user }) {

          if(user){
              token._id = user._id?.toString();
              token.isVerified = user.isVerified;
              token.isAcceptingMessages = user.isAcceptingMessages;
              token.username = user.username;
          }

          return token
      }
  }


}