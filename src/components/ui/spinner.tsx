import React from "react";

export const Spinner = () => (
    <div className="flex w-full justify-center">
        <div
            className="animate-spin inline-block w-4 h-4 border-2 rounded-full border-gray-400 border-t-transparent"
            role="status"
        ></div>
    </div>
);
