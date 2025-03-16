import untypedSubjectIndex from "@/app/generated/subject-index.json";
import { CourseRow } from "@/app/types";
import { NextResponse } from "next/server";

type SubjectIndex = {
  [subjectArea: string]: {
    [catalogNumber: string]: CourseRow[];
  };
};

const subjectIndex = untypedSubjectIndex as SubjectIndex;

// Generate all possible static paths for course API routes
export async function generateStaticParams() {
  const params = [];
  
  // Loop through all subject areas and catalog numbers in the data
  for (const subjectArea of Object.keys(subjectIndex)) {
    for (const catalogNumber of Object.keys(subjectIndex[subjectArea])) {
      params.push({
        subjectArea,
        catalogNumber,
      });
    }
  }
  
  return params;
}

export async function GET(
  _: Request,
  { params }: { params: { subjectArea: string; catalogNumber: string } },
) {
  const { subjectArea, catalogNumber } = params;

  return NextResponse.json(
    subjectIndex[subjectArea.toUpperCase()][catalogNumber.toUpperCase()],
  );
}

export type Response = SubjectIndex[string][string];
