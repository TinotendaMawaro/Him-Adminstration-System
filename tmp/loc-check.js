import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Icons } from "../MembersPortal";
function LocationEntry({ onComplete }) {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState({
    address_line_1: "",
    city: "",
    country: "Zambia",
    latitude: null,
    longitude: null
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 1e4);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timer);
        const { latitude, longitude } = position.coords;
        setAddress((prev) => ({ ...prev, latitude, longitude }));
        try {
          const response = await api.post("/location/reverse-geocode", {
            latitude,
            longitude
          });
          if (response.data?.success) {
            setAddress((prev) => ({
              ...prev,
              ...response.data.data,
              latitude,
              longitude
            }));
          }
        } catch {
        } finally {
          setLoading(false);
        }
      },
      () => {
        clearTimeout(timer);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 1e4, maximumAge: 6e5 }
    );
    return () => clearTimeout(timer);
  }, []);
  const mutation = useMutation({
    mutationFn: (data) => api.put("/members/me/location", data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        ["members", "me"],
        (old) => old ? {
          ...old,
          data: {
            ...old?.data ?? {},
            address_line_1: variables.address_line_1,
            city: variables.city,
            country: variables.country,
            latitude: variables.latitude,
            longitude: variables.longitude,
            location_captured: true
          }
        } : old
      );
      onComplete?.(response.data?.data ?? variables);
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!address.address_line_1 || !address.city || !address.country) {
      setError("Please fill in all required fields.");
      return;
    }
    mutation.mutate(address);
  };
  const handleSkip = () => {
    localStorage.setItem("location-entry-skipped", "1");
    onComplete?.(null);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg bg-[#0A192F] border border-white/10 rounded-2xl p-6 shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icons.MapPin, { className: "w-4 h-4 text-emerald-300" })), /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-white" }, "Set Your Location")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-400 mb-4" }, "Help us connect you with nearby home groups and events."), error && /* @__PURE__ */ React.createElement("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs" }, error), mutation.isError && /* @__PURE__ */ React.createElement("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs" }, "Failed to save location. Please try again."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider" }, "Address *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: address.address_line_1,
      onChange: (e) => setAddress({ ...address, address_line_1: e.target.value }),
      className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50",
      placeholder: "123 Main Street"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider" }, "City *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: address.city,
      onChange: (e) => setAddress({ ...address, city: e.target.value }),
      className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50",
      placeholder: "Lusaka"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider" }, "Country *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: address.country,
      onChange: (e) => setAddress({ ...address, country: e.target.value }),
      className: "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50",
      placeholder: "Zambia"
    }
  ))), loading && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-sky-300" }, "Detecting your location...")), address.latitude && address.longitude && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg" }, /* @__PURE__ */ React.createElement(Icons.Check, { className: "w-4 h-4 text-emerald-300" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-emerald-300" }, "Location detected: ", address.city || "Unknown city")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: mutation.isPending,
      className: "w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-70 shadow-lg shadow-emerald-500/20"
    },
    mutation.isPending ? "Saving..." : "Continue"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleSkip,
      disabled: mutation.isPending,
      className: "w-full py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
    },
    "Skip for now \u2014 I'll add this later"
  ))));
}
export {
  LocationEntry as default
};
