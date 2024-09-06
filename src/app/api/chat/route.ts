import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages, StreamData } from 'ai';


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// handle zod errors : todo
export async function POST(req: Request) {
  const {messages} = await req.json();
  
  const data = new StreamData();
  data.append({test:'value'})

  const result = await streamText({
    model: google('gemini-1.5-pro-latest'),
    messages: convertToCoreMessages(messages),
    onFinish() {
      data.close();
    }
  });

  return result.toDataStreamResponse({data})
}