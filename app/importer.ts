"use server";

import OpenAI from "openai";
import TurndownService from "turndown";

export async function importRecipe(
  html: string,
  apiKey: string
): Promise<ParsedRecipe | null> {
  const markdown = toMarkdown(html);

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

  return null;
}

export async function importRecipeParallel(
  html: string,
  apiKey: string
): Promise<ParsedRecipe | null> {
  const responses = await Promise.all([
    importRecipeMetadata(html, apiKey),
    importRecipeIngredients(html, apiKey),
    importRecipeMethods(html, apiKey),
  ]);

  if (responses[0] && responses[1] && responses[2]) {
    return {
      ...responses[0],
      ...responses[1],
      ...responses[2],
    };
  }

  return null;
}

export async function importRecipeMetadata(html: string, apiKey: string) {
  const markdown = toMarkdown(html);

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
          },
          required: ["title", "banner_url", "prep_time", "total_time"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0,
    max_tokens: 16383,
  });

  const data = response.choices[0].message.content;
  if (data) {
    return JSON.parse(data) as Pick<
      ParsedRecipe,
      "title" | "banner_url" | "prep_time" | "total_time"
    >;
  }
}

export async function importRecipeIngredients(html: string, apiKey: string) {
  const markdown = toMarkdown(html);

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
            ingredients: {
              type: "array",
              description:
                "A list of ingredients required, including their quantities.",
              items: {
                type: "string",
              },
            },
          },
          required: ["ingredients"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0,
    max_tokens: 16383,
  });

  const data = response.choices[0].message.content;
  if (data) {
    return JSON.parse(data) as Pick<ParsedRecipe, "ingredients">;
  }
}

export async function importRecipeMethods(html: string, apiKey: string) {
  const markdown = toMarkdown(html);

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
            methods: {
              type: "array",
              description: "A list of methods for preparing the recipe.",
              items: {
                type: "string",
              },
            },
          },
          required: ["methods"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0,
    max_tokens: 16383,
  });

  const data = response.choices[0].message.content;
  if (data) {
    return JSON.parse(data) as Pick<ParsedRecipe, "methods">;
  }
}

function toMarkdown(html: string): string {
  const turndownService = new TurndownService();
  turndownService.remove("script");

  return turndownService.turndown(html);
}

export type ParsedRecipe = {
  title: string;
  banner_url: string;
  prep_time: number;
  total_time: number;
  methods: string[];
  ingredients: string[];
};
