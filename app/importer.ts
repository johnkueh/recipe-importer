"use server";

import OpenAI from "openai";
import TurndownService from "turndown";

function toMarkdown(html: string): string {
  const turndownService = new TurndownService();
  turndownService.remove("script");

  return turndownService.turndown(html);
}

export async function importRecipe(html: string, apiKey: string) {
  const markdown = toMarkdown(html);

  console.log(markdown);

  const openai = new OpenAI({
    apiKey,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Extract structured recipe data from a given markdown snippet",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: markdown,
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recipe",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the recipe.",
            },
            banner_url: {
              type: "string",
              description: "URL of the banner image for the recipe.",
            },
            prep_time: {
              type: "number",
              description: "Preparation time in seconds.",
            },
            total_time: {
              type: "number",
              description:
                "Total time to prepare and cook the recipe in seconds.",
            },
            methods: {
              type: "array",
              description: "A list of methods for preparing the recipe.",
              items: {
                type: "string",
              },
            },
            ingredients: {
              type: "array",
              description:
                "A list of ingredients required, including their quantities.",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "title",
            "banner_url",
            "prep_time",
            "total_time",
            "methods",
            "ingredients",
          ],
          additionalProperties: false,
        },
      },
    },
    temperature: 0,
    max_tokens: 16383,
  });

  const data = response.choices[0].message.content;
  if (data) {
    return JSON.parse(data) as ParsedRecipe;
  }
}

export type ParsedRecipe = {
  title: string;
  banner_url: string;
  prep_time: number;
  total_time: number;
  methods: string[];
  ingredients: string[];
};
