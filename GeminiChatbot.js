// GeneZ Gemini AI Assistant Component
window.GeminiChatbot = function({
  organism,
  gene,
  records,
  comparativeData,
  apiKey,
  onOpenApiKeyModal
}) {
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      text: `Hello! I am your GeneZ BioAssistant powered by Google Gemini. I have loaded the full NCBI annotations and sequence analysis metrics for **${gene}** in *${organism}*. What biological concept, pathway, or sequence variation would you like me to explain?`
    }
  ]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  // Auto-scroll chat to latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Suggested prompt chips
  const suggestedPrompts = [
    `Explain the biological role of ${gene}`,
    `Why is GC content (${comparativeData.summary_stats?.gc?.avg || 50}%) significant here?`,
    `What protein or enzyme product does it encode?`,
    `Why do these retrieved sequence lengths differ?`
  ];

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organism: organism,
          gene: gene,
          records: records,
          comparative: comparativeData,
          message: textToSend,
          api_key: apiKey || ""
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: resData.reply, model: resData.model_used }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: resData.reply || `Notice: ${resData.error || "Unable to complete query."}`,
            isError: !resData.reply
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Connection Error: Could not reach the GeneZ AI service (${err.message}). Please ensure the Flask server is running.`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple Markdown parser for bold, italics, code, bullet points
  const formatMarkdown = (content) => {
    if (!content) return "";

    // Split into paragraphs / lines
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-teal-300 font-bold text-sm mt-3 mb-1 border-b border-slate-800 pb-1">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      // Heading 2
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-teal-400 font-bold text-base mt-4 mb-2">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      // Bullet list item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs my-0.5 leading-relaxed">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      // Blockquote
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-2 border-teal-400 pl-3 py-1 my-2 text-xs italic text-slate-300 bg-teal-500/5 rounded-r">
            {renderInlineMarkdown(trimmed.substring(2))}
          </blockquote>
        );
      }
      // Horizontal rule
      if (trimmed === "---") {
        return <hr key={idx} className="border-slate-800 my-2" />;
      }
      // Regular paragraph or empty line
      if (!trimmed) {
        return <div key={idx} className="h-1.5"></div>;
      }

      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed mb-1.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Parse inline **bold**, *italic*, `code`
  const renderInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="text-teal-200 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="bg-slate-900 border border-slate-700/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-cyan-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card flex flex-col h-[640px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-sm shadow">
            <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>GeneZ Biological AI Assistant</span>
              <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded">
                Google Gemini
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Active Context: <span className="text-slate-200 font-semibold">{gene}</span> in <em className="text-slate-300">{organism}</em> ({records.length} records analyzed)
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ role: "assistant", text: "Chat history cleared. How can I assist with your sequence analysis?" }])}
          className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
          title="Clear chat messages"
        >
          Clear
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-3 shrink-0">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-950 border border-teal-500/30 text-teal-300 hover:bg-teal-500/15 transition whitespace-nowrap disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 select-text">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? "bg-slate-700 text-slate-200"
                    : "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                }`}
              >
                {isUser ? "U" : "G"}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs ${
                  isUser
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : msg.isError
                    ? "bg-red-950/40 border border-red-500/40 text-red-200"
                    : "bg-slate-950/90 border border-slate-800 text-slate-200 shadow-inner"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="ai-prose">{formatMarkdown(msg.text)}</div>
                )}
                {msg.model && (
                  <div className="text-[9px] text-slate-500 mt-2 font-mono text-right">
                    Model: {msg.model}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-teal-400 bg-slate-950/80 border border-teal-500/20 px-3.5 py-2.5 rounded-xl w-fit">
            <svg className="animate-spin w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Analyzing biological context with Google Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this gene, pathways, GC content, or protein product..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

