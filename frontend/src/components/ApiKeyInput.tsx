
import React, {useState} from 'react';

type ApiKeyInputProps = {
    setApiKey: (value: string) => void;
};

const ApiKeyInput = ({setApiKey}: ApiKeyInputProps)  => {
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

export default ApiKeyInput;