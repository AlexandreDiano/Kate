interface MessageProps {
    text: string;
    sender: 'user' | 'bot';
}

const Message = ({ text, sender }: MessageProps) => {
    const isUser = sender === 'user';
    const messageClass = isUser ? 'bg-blue-100 self-end' : 'bg-green-100 self-start';

    return (
        <div className={`p-3 my-2 rounded-lg min-w-64 max-w-3xl break-words text-black ${messageClass}`}
             dangerouslySetInnerHTML={{ __html: text }}>
        </div>
    );
};

export default Message;
