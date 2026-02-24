import { NextResponse } from "next/server";

export const buildNotImplementedResponse = (
  endpointName: string
): NextResponse => {
  return NextResponse.json(
    {
      message: `${endpointName} endpoint is planned but not implemented yet.`,
    },
    { status: 501 }
  );
};
