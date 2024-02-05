import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Send } from "lucide-react";

// TODO use styles from DaisyUI
type UserChatInputProps = {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function UserChatInput({
  input,
  handleInputChange,
  handleSubmit,
}: UserChatInputProps) {
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex">
        <>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full "
          />
        </>
        <Button className="bg-blue-600 ml-2">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export default UserChatInput;
