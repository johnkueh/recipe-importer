"use client";

import { Button } from "@/components/ui/button";
import { importRecipe } from "./importer";
import { useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [html, setHtml] = useState("");

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Recipe importer</h1>
      <div className="mt-8 space-y-3">
        <div>
          <h2 className="text-xl font-semibold">1. Enter OpenAI API key</h2>
          <textarea
            className="mt-3 text-xs w-96 border border-gray-200 p-1"
            rows={5}
            placeholder=""
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">2. Copy/paste HTML</h2>
          <p className="text-sm text-gray-800">
            Right click on website ➡️ View page source ➡️ Select all &amp; copy
            ➡️ Paste below
          </p>
          <textarea
            className="mt-3 text-xs w-96 border border-gray-200 p-1"
            rows={8}
            placeholder="<html><body><h1>recipe content</h1></body></html>"
            onChange={(e) => setHtml(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Single prompt</h2>
          <Button
            onClick={async () => {
              const response = await importRecipe(html, apiKey);
              console.log(response);
            }}
          >
            Start
          </Button>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Parallel prompts</h2>
          <Button>Start</Button>
        </div>
      </div>
    </div>
  );
}
