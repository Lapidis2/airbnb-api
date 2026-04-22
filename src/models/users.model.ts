export type userRole="host" | "guest";
export interface User{
    id:number;
    name:string;
    email:string;
    phone:string;
    role:userRole;  
    avatar?:string;
    username:string;
    bio?:string;

}
export const users:User[]=[
    {
    id: 1,
    name: "Jean Pierre",
    email: "john@gmail.com",
    username: "johnny",
    phone: "123456789",
    role: "host",
    avatar: "https://example.com/avatar.jpg",
    bio: "I am a host on Airbnb."
    },
    {
     id: 2,
    name: "Peter",
    email: "peter@gmail.com",
    username: "peter123",
    phone: "987654321",
    role: "guest",
    avatar: "https://example.com/avatar2.jpg",
    bio: "I am a guest on Airbnb."
    },
      {
    id: 3,
    name: "Eric",
    email: "eric@gmail.com",
    username: "ericy",
    phone: "456123789",
    role: "host",
    avatar: "https://example.com/avatar3.jpg",
    bio: "I am a host on Airbnb."
  },
  {
    id: 4,
    name: "caleb",
    email: "caleb@gmail.com",
    username: "caleb123",
    phone: "456123789",
    role: "host",
    avatar: "https://example.com/avatar4.jpg",
    bio: "I am a host on Airbnb."
  }

]