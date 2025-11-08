import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "What is Symbiont?",
    answer:
      "Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.",
  },

  {
    question: "How is Symbiont different from LLMs?",
    answer:
      "Symbiont is designed to answer questions based on the resources provided. It is much less likely to hallucinate information (i.e. make up things)",
  },
  {
    question: "What is the price of Symbiont?",
    answer:
      "Symbiont is completely free to use. It only requires your API keys for the model you want to use. This gives you full control over the costs and usage of Symbiont.",
  },
  {
    question: "Where can I get the API key?",
    answer:
      "API Keys for various LLMs and models can be gotten from a provider like OpenAI, Anthropic or Google.",
  },
  {
    question: "What will my API key be used for?",
    answer:
      "The API key will be used for accessing an LLM like GPT. If you provide an OpenAI key and use GPT models, your API key will also be used for the default Embeddings model. Embedding models are usually very cheap. If you use different models than OpenAI then a free embeddings model will be used. Bear in mind that using different embeddings model can also effect the search results",
  },

  {
    question: "How can I request new features?",
    answer:
      "To request new features and report bugs, you can reach us at symbiont-me@gmail.com",
  },
];

const FAQ = () => {
  return (
    <>
      <h2 className="font-bold text-2xl mb-4 text-center pt-4"> FAQs </h2>

      <div className="mx-2">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => {
            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-bold text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-light">
                  {faq.question === "Where can I get the API key?" ? (
                    <>
                      <p>{faq.answer}</p>
                      <ul className="pl-4 mt-2">
                        <li>
                          OpenAI:{" "}
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline hover:text-blue-800 "
                          >
                            https://platform.openai.com/api-keys
                          </a>
                        </li>
                        <li>
                          Anthropic:{" "}
                          <a
                            href="https://docs.anthropic.com/claude/reference/getting-started-with-the-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline hover:text-blue-800 "
                          >
                            https://docs.anthropic.com/claude/reference/getting-started-with-the-api
                          </a>
                        </li>
                      </ul>
                    </>
                  ) : (
                    faq.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </>
  );
};

export default FAQ;
