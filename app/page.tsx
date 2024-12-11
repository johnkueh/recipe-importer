"use client";

import { Button } from "@/components/ui/button";
import { importRecipe, ParsedRecipe } from "./importer";
import { useState } from "react";
import clsx from "clsx";
import { isEmpty } from "lodash";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [html, setHtml] = useState("");
  const startEnabled = !isEmpty(apiKey) && !isEmpty(html);

  return (
    <div className="p-10">
      <div className="flex flex-row">
        <div className="w-1/3">
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
                Right click on website ➡️ View page source
                <br />
                ➡️ Select all &amp;copy ➡️ Paste below
              </p>
              <textarea
                className="mt-3 text-xs w-96 border border-gray-200 p-1"
                rows={30}
                placeholder="<html><body><h1>recipe content</h1></body></html>"
                onChange={(e) => setHtml(e.target.value)}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">3. Click Start</h2>
            </div>
          </div>
        </div>
        <div className="w-2/3">
          <div className="space-y-3">
            <SinglePrompt enabled={startEnabled} html={html} apiKey={apiKey} />
            <div className="w-full h-[1px] bg-gray-800" />
            <ParallelPrompts
              enabled={startEnabled}
              html={html}
              apiKey={apiKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type PromptProps = {
  enabled: boolean;
  html: string;
  apiKey: string;
};

function SinglePrompt({ enabled, html, apiKey }: PromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ParsedRecipe>();
  const [elapsedTime, setElapsedTime] = useState<number>();

  return (
    <div className="space-y-3">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold">Single prompt</h2>
        <div className="flex flex-row space-x-3 items-center">
          {elapsedTime && (
            <span className="text-sm text-gray-500">{`${elapsedTime}ms`}</span>
          )}
          <Button
            disabled={!enabled || isLoading}
            onClick={async () => {
              setIsLoading(true);
              const startTime = Date.now();
              const response = await importRecipe(html, apiKey);

              const endTime = Date.now();
              setElapsedTime(endTime - startTime);
              setResponse(response);
              setIsLoading(false);
            }}
          >
            {isLoading ? "Loading..." : "Start"}
          </Button>
        </div>
      </div>
      {response && <RecipePreview recipe={response} />}
    </div>
  );
}

function ParallelPrompts({ enabled, html, apiKey }: PromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ParsedRecipe>();

  return (
    <div className="space-y-3">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-semibold">Parallel prompts</h2>
        <Button
          disabled={!enabled || isLoading}
          onClick={async () => {
            setIsLoading(true);
            const response = await importRecipe(html, apiKey);
            setResponse(response);
            setIsLoading(false);
          }}
        >
          {isLoading ? "Loading..." : "Start"}
        </Button>
      </div>
      {response && <RecipePreview recipe={response} />}
    </div>
  );
}

type RecipePreviewProps = {
  recipe: ParsedRecipe;
};

function RecipePreview({ recipe }: RecipePreviewProps) {
  const [view, setView] = useState<"preview" | "json">("preview");

  return (
    <div className="space-y-3">
      <div className="space-x-3">
        <button
          className={clsx(
            view === "preview" ? "text-green-500" : "text-gray-600"
          )}
          onClick={() => setView("preview")}
        >
          Preview
        </button>
        <button
          className={clsx(view === "json" ? "text-green-500" : "text-gray-600")}
          onClick={() => setView("json")}
        >
          JSON
        </button>
      </div>
      {view === "preview" ? (
        <div className="space-y-3">
          <div className="space-x-3 flex flex-row">
            <img className="w-64 rounded-lg" src={recipe.banner_url} />
            <div>
              <h1 className="text-2xl tracking-tight leading-tighter font-bold">
                {recipe.title}
              </h1>

              <div>
                <p>Prep time (secs): {recipe.prep_time}</p>
                <p>Total time (secs): {recipe.total_time}</p>
                <p>
                  Banner URL:{" "}
                  <a
                    target="_blank"
                    href={recipe.banner_url}
                    className="text-blue-500 break-all"
                  >
                    {recipe.banner_url}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <ul className="mt-2 text-sm list-disc pl-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Methods</h2>
              <ul className="mt-2 text-sm list-disc pl-4">
                {recipe.methods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <pre className="text-xs">{JSON.stringify(recipe, null, 2)}</pre>
      )}
    </div>
  );
}
