import { useState } from 'react';
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

interface InputBoxProps {
    disabled?: boolean;
    onSend: (text: string) => void;
}

const InputBox = ({ onSend, disabled }: InputBoxProps) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        onSend(text);
        setText('');
    };

    return (
        <div className="flex p-4">
            <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
                disabled={disabled}
            />
            <Button onClick={handleSend} disabled={disabled} className="p-2 bg-blue-500 text-white rounded-lg">
                Send
            </Button>
        </div>
    );
};

export default InputBox;
