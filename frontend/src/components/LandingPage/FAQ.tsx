import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "What is Symbiont?",
    answer: "Sym",
  },
  {
    question: "What is the price of Symbiont?",
    answer:
      "Symbiont is completely free to use. It only requires your API keys for the model you want to use. This gives you full control over the costs and usage of Symbiont.",
  },
  {
    question: "Where can I get the API key?",
    answer:
      "API Keys for various LLMs and models can be gotten from a provider like OpenAI, Anthropic or Google. \n OpenAI: https://platform.openai.com/api-keys \n Anthropic: https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
  },
  {
    question: "What can I use Symbiont for?",
    answer: "",
  },

  {
    question: "What is the price of Symbiont?",
    answer: "",
  },
  { question: "How can I request new features ?", answer: "" },
];

const FAQ = () => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="font-bold text-2xl"> FAQs </h2>
      {faqs.map((faq) => {
        return (
          <>
            <Accordion className="w-full pl-10 pr-10">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                {faq.question}
              </AccordionSummary>
              <AccordionDetails>{faq.answer}</AccordionDetails>
            </Accordion>
          </>
        );
      })}
    </div>
  );
};

export default FAQ;
