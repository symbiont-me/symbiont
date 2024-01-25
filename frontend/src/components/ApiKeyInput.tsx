
import React, {useState} from 'react';

type Props = {
    setApiKey: (value: string) => void;
};

export default function ApiKeyInput ({setApiKey}: Props) {
    const [apiKey, setApiKeyLocal] = useState('');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiKey(apiKey);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKeyLocal(e.target.value);
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                     name="apiKeyInput"
                     type="text"
                     placeholder="Enter API key"
                     value={apiKey}
                     onChange={handleInputChange}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}