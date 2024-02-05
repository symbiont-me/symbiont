import {TextModels} from '@/const';

type ModelSelectDropdownProps = {
    setModel: (model: TextModels) => void;
};

const ModelSelectDropdown = ({setModel}:ModelSelectDropdownProps) => {
  return (
    <div>
        <select 
          className="select select-success w-full max-w-xs" 
          onChange={(e) => setModel(e.target.value as TextModels)}
          defaultValue=""  
        >
          <option value="" disabled>Pick a Model</option> 
          {Object.values(TextModels).map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
    </div>
  )
}

export default ModelSelectDropdown;