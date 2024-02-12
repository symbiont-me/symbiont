import React from "react";
import { ViewSelected } from "@/const";

type NavigationProps = {
  setViewSelected: (view: ViewSelected) => void;
};

const Navigation = ({ setViewSelected }: NavigationProps) => {
  return (
    <nav className="flex justify-between items-center p-4 bg-symbiont-900 rounded-2xl mb-2 mt-2">
      <div className="flex gap-4">
        {Object.values(ViewSelected).map((view) => (
          <button key={view} onClick={() => setViewSelected(view)}>
            <p className="capitalize text-xs text-symbiont-textUnSelected">
              {view}
            </p>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
