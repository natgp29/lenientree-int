import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Admin from "./Admin";

function Staff() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRole();
    }, []);

    async function loadRole() {
        const {
            data: { user }
        } = await supabase.auth.getUser();
       

        if (!user) {
            window.location.href = "/admin";
            return;
        }

        const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (error || !data) {
            console.error(error);
            setLoading(false);
            return;
        }

        setRole(data.role);
        setLoading(false);
    }

    if (loading) {
        return <div className="loading">Loading staff dashboard...</div>;
    }

    if (!role) {
        return <div className="loading">Unable to determine staff role.</div>;
    }

    return <Admin role={role} />;
}

export default Staff;
