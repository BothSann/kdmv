"use client";
import ProductList from "@/components/ProductList";
import MainCarousel from "@/components/MainCarousel";
import Footer from "@/components/Footer";
import useAuthStore from "@/store/useAuthStore";
import useAuthorization from "@/hooks/useAuthorization";

export default function Home() {
  const { profile, role, user, isLoading } = useAuthStore();
  const { isAuthenticated } = useAuthorization();
  console.log("user", user);
  return (
    <>
      <CustomerHomePage />
      <div className="p-4 m-4 rounded">
        <h2 className="font-bold text-lg mb-2">Auth Debug Info:</h2>
        <p>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </p>
        <p>
          <strong>User:</strong> {user ? user.email : "None"}
        </p>
        <p>
          <strong>User is Authenticated?:</strong> {user ? user.role : "None"}
        </p>
        <p>
          <strong>User is Authenticated?:</strong>{" "}
          {isAuthenticated() ? "Yes" : "No"}
        </p>
        <p>
          <strong>Profile:</strong>{" "}
          {profile ? `${profile.first_name} ${profile.last_name}` : "None"}
        </p>
        <p>
          <strong>Role:</strong> {role || "None"}
        </p>
      </div>
      <h1>
        Hello {profile?.first_name} {profile?.last_name} - {role} -{" "}
        {user?.email}
      </h1>
      <h1>Your role is {role}</h1>
      {/* <CartDrawer /> */}
    </>
  );
}

function CustomerHomePage() {
  return (
    <>
      <MainCarousel />
      <ProductList />
      <Footer />
    </>
  );
}
