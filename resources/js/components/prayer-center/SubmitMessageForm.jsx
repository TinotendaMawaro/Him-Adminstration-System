import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const Icons = {
    Heart: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    ChatBubble: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-1.44 0-2.79-.38-3.96-1.04L2.25 21V12z" />
        </svg>
    ),
    Sun: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    AlertTriangle: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-9" />
        </svg>
    ),
    Loader: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeLinecap="round" className="animate-spin" />
        </svg>
    ),
};

export default function SubmitMessageForm({ onSuccess, onCancel }) {
    const queryClient = useQueryClient();
    const [categoryId, setCategoryId] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("normal");
    const [errors, setErrors] = useState({});

    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: ["prayer-center-categories"],
        queryFn: async () => {
            const res = await api.get("/prayer-center/categories");
            if (!res.data.success) throw new Error(res.data.message || "Failed to load categories");
            return res.data.data;
        },
    });

    const categories = categoriesData || [];

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post("/prayer-center/messages", data);
            if (!res.data.success) throw new Error(res.data.message || "Failed to submit");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prayer-center-messages"] });
            onSuccess?.();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!categoryId) newErrors.category_id = "Please select a message type";
        if (!subject.trim()) newErrors.subject = "Please enter a subject";
        if (!message.trim()) newErrors.message = "Please enter your message";
        if (message.trim().length > 5000) newErrors.message = "Message is too long (max 5000 characters)";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        submitMutation.mutate({
            category_id: parseInt(categoryId),
            subject: subject.trim(),
            message: message.trim(),
            priority,
        });
    };

    const selectedCategory = categories.find((c) => c.id === parseInt(categoryId));

    const getCategoryIcon = (name) => {
        switch (name) {
            case "prayer_request": return Icons.Heart;
            case "counseling_request": return Icons.ChatBubble;
            case "testimony": return Icons.Sun;
            default: return Icons.Heart;
        }
    };

    if (categoriesLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icons.Loader className="w-6 h-6 text-[#D4AF37] animate-spin" />
                <span className="ml-3 text-sm text-gray-600">Loading message types...</span>
            </div>
        );
    }

    if (categoriesError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">
                    Failed to load message types. Please refresh and try again.
                </p>
                <button
                    type="button"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["prayer-center-categories"] })}
                    className="mt-3 mx-auto block text-xs text-[#D4AF37] hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!categories.length) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm text-center">
                    No message types available right now. Please contact your pastor.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* CATEGORY SELECTOR */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What would you like to share?</label>
                <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat.name);
                        const isSelected = categoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategoryId(cat.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${
                                    isSelected
                                        ? "border-[#D4AF37] bg-amber-50 shadow-md"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                                <div
                                    className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: (cat.color || "#D4AF37") + "20" }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: cat.color || "#D4AF37" }} />
                                </div>
                                <p className="text-xs font-bold text-gray-900">{cat.label}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{cat.description}</p>
                            </button>
                        );
                    })}
                </div>
                {errors.category_id && <p className="text-red-600 text-xs mt-1.5">{errors.category_id}</p>}
            </div>

            {/* SUBJECT */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your request..."
                    className={`w-full bg-white border ${errors.subject ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all`}
                />
                {errors.subject && <p className="text-red-600 text-xs mt-1">{errors.subject}</p>}
            </div>

            {/* MESSAGE */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {selectedCategory?.name === "counseling_request" ? "Tell us what you need counsel with..." :
                     selectedCategory?.name === "testimony" ? "Share your story..." :
                     "Your message"}
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                        selectedCategory?.name === "prayer_request" ? "Please share your prayer request in detail. Our prayer team will stand with you in faith..." :
                        selectedCategory?.name === "counseling_request" ? "Describe your situation so we can connect you with the right support..." :
                        selectedCategory?.name === "testimony" ? "We would love to hear how God has moved in your life..." :
                        "Write your message here..."
                    }
                    rows={6}
                    className={`w-full bg-white border ${errors.message ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none`}
                />
                <div className="flex justify-between mt-1">
                    {errors.message && <p className="text-red-600 text-xs">{errors.message}</p>}
                    <p className="text-xs text-gray-500 ml-auto">{message.length}/5000</p>
                </div>
            </div>

            {/* PRIORITY */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <div className="flex gap-2">
                    {["low", "normal", "high", "urgent"].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all border ${
                                priority === p
                                    ? p === "urgent"
                                        ? "bg-red-50 border-red-300 text-red-800"
                                        : p === "high"
                                        ? "bg-amber-50 border-amber-300 text-amber-800"
                                        : p === "normal"
                                        ? "bg-sky-50 border-sky-300 text-sky-800"
                                        : "bg-gray-50 border-gray-300 text-gray-800"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                            {p === "urgent" && <Icons.AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 prayer-btn prayer-btn-ghost"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1 prayer-btn prayer-btn-gold"
                >
                    {submitMutation.isPending ? (
                        <span className="flex items-center gap-2">
                            <Icons.Loader className="w-4 h-4 animate-spin" />
                            Sending...
                        </span>
                    ) : (
                        <>
                            <Icons.Check className="w-4 h-4" />
                            Send {selectedCategory?.label || "Message"}
                        </>
                    )}
                </button>
            </div>

            {submitMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm text-center">
                        {submitMutation.error?.message || "Failed to submit. Please try again."}
                    </p>
                </div>
            )}
        </form>
    );
}
