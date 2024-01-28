import {TextModels} from '@/const';

type Props = {
    setModel: (model: TextModels) => void;
};

export default function ModelSelectDropdown({setModel}:Props) {
  return (
    <div>
        <select 
          className="select select-success w-full max-w-xs" 
          onChange={(e) => setModel(e.target.value as TextModels)}
          defaultValue=""  
        >
          <option value="" disabled>Pick a Model</option> {/* Removed selected from here */}
          {Object.values(TextModels).map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
    </div>
  )
}