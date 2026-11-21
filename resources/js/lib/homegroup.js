/** Where and when a home group meets: until the leader advises, it says so instead of showing a guess. */
export const meetingLabel = (g) => {
    if (!g) return "To be announced by the group leader";
    const time = typeof g.meeting_time === "string" ? g.meeting_time.slice(0, 5) : null;
    return [g.meeting_day, time, g.location].filter(Boolean).join(" · ") || "To be announced by the group leader";
};
