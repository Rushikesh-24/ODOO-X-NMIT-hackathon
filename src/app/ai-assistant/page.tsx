import  AIChat  from "@/components/ai-chat"
export default function AIAssistantPage() {
  return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">Get intelligent insights about your projects and tasks</p>
        </div>

        <div className="mx-auto">
          <AIChat />
        </div>
      </div>
  )
}