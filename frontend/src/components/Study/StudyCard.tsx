import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";
import { useStudyContext } from "@/app/context/StudyContext";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, FileText } from "lucide-react";
import Image from "next/image";


const placeholderImage =
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8";

export default function StudyCard({ study }: { study: Study }) {
  const studyContext = useStudyContext();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="w-80 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-md group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={study.image || placeholderImage}
          alt={study.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Delete button overlay */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            study._id && studyContext?.deleteStudy(study._id.toString());
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Section */}
      <Link href={`studies/${study._id}`} className="block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
            {study.name}
          </CardTitle>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(study?.createdAt?.toString())}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-start mb-3">
            <FileText className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
              {study.description || "No description provided"}
            </p>
          </div>
          
          {/* Study metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Active
            </div>
            <div className="text-xs text-gray-400">
              Study #{study._id?.toString().slice(-6)}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
