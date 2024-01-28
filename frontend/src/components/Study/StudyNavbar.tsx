import React from 'react';
import { ViewSelected } from '@/const';

const Navigation: React.FC<{ setViewSelected: (view: ViewSelected) => void }> = ({ setViewSelected }) => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-200">
      <div className="flex gap-4">
        {Object.values(ViewSelected).map(view => (
          <button key={view} onClick={() => setViewSelected(view)}>
            <p className='capitalize'>{view}</p>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;