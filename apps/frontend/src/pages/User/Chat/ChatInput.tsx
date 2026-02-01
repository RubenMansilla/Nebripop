import { useState } from "react";

interface ChatInputProps {
    onSend: (text: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage("");
        // Reset height manually usually handled by value change, but let's force it
        setTimeout(() => {
            const el = document.querySelector('.cr-textarea') as HTMLTextAreaElement;
            if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
            }
        }, 0);
    };

    return (
        <div className="cr-input-area">
            <textarea
                ref={(el) => {
                    if (el) {
                        el.style.height = "auto";
                        el.style.height = el.scrollHeight + "px";
                    }
                }}
                className="cr-input cr-textarea"
                value={message}
                onChange={e => {
                    setMessage(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Escribe un mensaje..."
                rows={1}
            />
            <button className="cr-send-btn" onClick={handleSend}>➤</button>
        </div>
    );
};

export default ChatInput;
