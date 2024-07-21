import { useEffect, useState } from 'react';
import Message from './Message';
import InputBox from './InputBox';

import { invoke } from '@tauri-apps/api/tauri';
import { marked } from 'marked';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';

interface MessageType {
    prompt: string;
    sender: 'user' | 'bot';
}

interface ModelType {
    name: string;
}

interface ApiResponse {
    success: boolean;
    data: string | null;
    error: string | null;
}

marked.setOptions({
    breaks: true,
});

const ChatBox = () => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modelList, setModelList] = useState<ModelType[]>([]);
    const [currentModel, setCurrentModel] = useState<string>("");

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await invoke<string>('index_models');
            const parsedResponse: ApiResponse = JSON.parse(response);

            if (parsedResponse.success && parsedResponse.data) {
                const models = JSON.parse(parsedResponse.data).models as ModelType[];
                setModelList(models);
                if (models.length > 0) {
                    const savedModel = localStorage.getItem('currentModel');
                    if (savedModel && models.find((model) => model.name === savedModel)) {
                        setCurrentModel(savedModel);
                    } else {
                        setCurrentModel(models[0].name);
                    }
                }
            } else {
                console.error('Failed to fetch models:', parsedResponse.error);
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        if (currentModel) {
            localStorage.setItem('currentModel', formatName(currentModel));
        }
    }, [currentModel]);

    const formatName = (name: string) => {
        return name.replace(':latest', '');
    };

    const handleSend = async (prompt: string) => {
        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, { prompt, sender: 'user' }]);

        const model = formatName(currentModel);

        try {
            const response: string = await invoke('generate_text', { model, prompt });
            const formattedResponse = marked(response);
            // @ts-ignore
            setMessages((prevMessages) => [
                ...prevMessages,
                { prompt: formattedResponse, sender: 'bot' },
            ]);
        } catch (error) {
            console.error('Error generating response:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModel = (value: string) => {
        setCurrentModel(value);
    };

    return (
        <div className="flex flex-col w-full h-screen">
            <div className="m-5">
                <Select value={currentModel} onValueChange={(value) => handleModel(value)}>
                    <SelectTrigger className="w-[180px] border-0 focus:border-0 active:border-0 blur:border-0">
                        <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {modelList.map((item) => (
                            <SelectItem key={item.name} value={item.name}>
                                {formatName(item.name)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex-col justify-center items-end">
                {messages.map((msg, index) => (
                    <Message key={index} text={msg.prompt} sender={msg.sender} />
                ))}
                {loading && (
                    <div className="space-y-2 py-2">
                        <Skeleton className="h-5 w-96 bg-green-200" />
                        <Skeleton className="h-5 w-64 bg-green-200" />
                    </div>
                )}
            </div>
            <InputBox onSend={handleSend} disabled={loading} />
        </div>
    );
};

export default ChatBox;
