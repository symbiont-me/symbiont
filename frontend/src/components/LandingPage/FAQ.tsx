import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Divider from "@mui/material/Divider";

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
      "API Keys for various LLMs and models can be gotten from a provider like OpenAI, Anthropic or Google. \n OpenAI: https://platform.openai.com/api-keys \n Anthropic: https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
  },
  {
    question: "What will my API key be used for?",
    answer:
      "The API key will be used for accessing an LLM like GPT. If you provide an OpenAI key and use GPT models, your API key will also be used for the default Embeddings model. The embeddings model is extremely cheap. So it shoudn't be too much of a worry. If you use different models than OpenAI then a free embeddings model will be used. Bear in mind that using different embeddings model can also effect the search results",
  },

  {
    question: "How can I request new features ?",
    answer:
      "To request new features and report bugs, you can reach us at symbiont-me@gmail.com",
  },
];

const FAQ = () => {
  return (
    <>
      <h2 className="font-bold text-2xl mb-4 text-center pt-4"> FAQs </h2>

      {faqs.map((faq, index) => {
        return (
          <div className="h-full ml-2 mr-2" key={index}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ fontWeight: 800 }}
              >
                {faq.question}
              </AccordionSummary>
              <Divider />
              <AccordionDetails sx={{ fontWeight: 100 }}>
                {faq.answer}
              </AccordionDetails>
            </Accordion>
          </div>
        );
      })}
    </>
  );
};

export default FAQ;
