"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [count, setCout] = useState(0)
  const [user, setUser] = useState<any>(null);

  const handleIncement = () => {
    setCout((prev) => prev + 1)
  }
  const handleDecrement = () => {
    if(count <= 0 ) return
    setCout((prev) => prev - 1)
    
  }
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    // console.log(`token = `, token);
    
    if (!token) {
      router.push("/admin/dashboard");
      return;
    }

    // Opsional: cek validasi token ke backend
    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("admin-token");
        router.push("/admin/login");
      });
  }, [router]);

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 flex flex-col">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Selamat datang, {user.username}!</p>
      <button
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem("admin-token");
          router.push("/admin/login");
        }}
      >
        Logout
      </button>

      <button className="px-2 py-3 rounded-md bg-black text-white " onClick={() => handleIncement()}>
       Increment
      </button>
      <span className="text-center">{count}</span>
      <button className="px-2 py-3 rounded-md bg-lime-200" onClick={() => handleDecrement()}>
       Decrement      
       </button>
       <button className="px-2 py-3 rounded-md bg-lime-200" onClick={() => setCout(0)}>
       Reset
      </button>
    </div>
  );  
}
