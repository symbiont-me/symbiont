import { Study } from "@/types";

const StudyInfo = ({ study }: { study: Study }) => {
  const placeholder =
    "https://images.unsplash.com/photo-1455390582262-044cdead277a";

  console.log(study);
  return (
    <div className="w-full h-20 bg-symbiont-foreground mt-2 mb-2 p-4 rounded-2xl flex flex-row justify-between">
      <div className="flex flex-col flex-start">
        <h1 className="text-sm mb-2">{study?.name}</h1>
        <p className="text-symbiont-textUnSelected text-xs ">Description</p>
      </div>
      <div className="flex flex-col mr-8">
        <img
          className="h-10 w-10 bg-symbiont-chatMessageUser rounded-full"
          src={study?.image ? study.image : placeholder}
        />
      </div>
    </div>
  );
};

export default StudyInfo;
