'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Groq } from 'groq-sdk'

type OutputType = {
  "One liner": string;
  "Value Proposition": string;
  "Site Map": string[];
  "Blog Ideas": string[];
  "SEO Terms": string[];
}

export function SeoGenerator() {
  const [url, setUrl] = useState('')
  const [keywords, setKeywords] = useState('')
  const [businessInfo, setBusinessInfo] = useState('')
  const [output, setOutput] = useState<OutputType | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!url) {
      setError('Website URL is required')
      setIsLoading(false)
      return
    }

    try {
      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      })

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Generate the json with following attributes\n\nOne liner (string)\nValue Proposition (string)\nSite Map (string array)\nBlog Ideas (string array)\nSEO Terms (string array)\n\nScrape the website pages to provide meaningful response"
          },
          {
            role: "user",
            content: `I want to autogenerate content for my website and other channels based on the trending SEO terms to show how your product fits into what's currently popular\n\nWebsite: ${url}\nProposed SEO key terms: ${keywords} - add trending SEO terms too from your side\nBusiness information: ${businessInfo}\n\nI need the response in this format:\nOne liner (max 10 words):\nValue Proposition:\nSite Map:\nBlog Ideas:\nSEO Terms:\n\n\n`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: {
          type: "json_object"
        },
        stop: null
      })

      const data = JSON.parse(chatCompletion.choices[0].message.content?? "{}") as OutputType
      setOutput(data)
    } catch (error) {
      setError('An error occurred while generating SEO content')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>SEO Content Generator</CardTitle>
          <CardDescription>Enter your website details to generate SEO content</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">Website URL</label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">SEO Keywords (optional)</label>
              <Input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. digital marketing, SEO, web design"
              />
            </div>
            <div>
              <label htmlFor="businessInfo" className="block text-sm font-medium text-gray-700">Business Information</label>
              <Textarea
                id="businessInfo"
                value={businessInfo}
                onChange={(e) => setBusinessInfo(e.target.value)}
                placeholder="Describe your business..."
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Content'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {output && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">One-liner:</h3>
                <p>{output["One liner"]}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Value Proposition:</h3>
                <p>{output["Value Proposition"]}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Suggested Site Map:</h3>
                {output["Site Map"] && Array.isArray(output["Site Map"]) ? (
                  <ul className="list-disc pl-5">
                    {output["Site Map"].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No site map available</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Blog Ideas:</h3>
                {output["Blog Ideas"] && Array.isArray(output["Blog Ideas"]) ? (
                  <ul className="list-disc pl-5">
                    {output["Blog Ideas"].map((idea, index) => (
                      <li key={index}>{idea}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No blog ideas available</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">SEO Terms:</h3>
                {output["SEO Terms"] && Array.isArray(output["SEO Terms"]) ? (
                  <ul className="list-disc pl-5">
                    {output["SEO Terms"].map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No SEO terms available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}