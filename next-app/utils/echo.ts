import Echo from "laravel-echo";
import Pusher from "pusher-js";

// @ts-ignore
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher", // Laravel Reverb uses the Pusher protocol
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "",
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
  wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
  wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080, // optional
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  cluster: "mt1", // dummy cluster so Pusher-js doesn’t complain
  authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`
    }
  }
});

export default echo;
