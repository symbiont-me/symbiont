"use client";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { useStudyContext } from "@/app/context/StudyContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, BookOpen } from "lucide-react";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import "./styles.css";

const UserDashboard = () => {
  const studyContext = useStudyContext();
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
    }
  }, [studyContext, studies]);

  function fetchStudies() {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
      return studyContext.allStudies;
    }
  }

  const alerts = [
    "This app is currently in development and test mode.",
    "Please don't upload sensitive data - expect bugs and unfinished features.",
    "Expect data to be deleted without warning.",
    "Note: Other than that feel free to use the app and give feedback.",
  ];

  return (
    <div className="dashboard-container overflow-hidden h-screen">
      <div className="left-sidebar">
        <LeftSideBar />
      </div>
      <div className="dashboard flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Studies</h1>
                  <p className="text-sm text-gray-600">
                    {studies.length} active {studies.length === 1 ? 'study' : 'studies'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="px-6 py-4">
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> This app is in test mode. Don't upload sensitive data. 
                Expect bugs and data may be deleted without warning.
              </AlertDescription>
            </Alert>
          </div>

          {/* Studies Grid */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* New Study Card */}
              <NewStudyCard onNewStudyCreated={fetchStudies} />
              
              {/* Existing Studies */}
              {studies.map((study) => (
                <StudyCard key={study._id} study={study} />
              ))}
            </div>

            {/* Empty State */}
            {studies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No studies yet</h3>
                <p className="text-gray-500 max-w-md">
                  Create your first study to start organizing your research and collecting data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
