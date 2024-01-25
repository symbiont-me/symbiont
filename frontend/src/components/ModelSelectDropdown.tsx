import {TextModels} from '@/const';

type Props = {
    setModel: (model: TextModels) => void;
  };

export default function ModelSelectDropdown({setModel}:Props) {
  return (
    <div>
        <select  onChange={(e) => setModel(e.target.value as TextModels)}>

          {Object.values(TextModels).map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      
    </div>
  )
}