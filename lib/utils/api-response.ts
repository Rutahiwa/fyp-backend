import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message: string = "Success", statusCode: number = 200) {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
}

export function errorResponse(message: string, statusCode: number = 400, errors?: any) {
  return NextResponse.json({ success: false, message, errors }, { status: statusCode });
}

export function paginatedResponse<T>(data: T, total: number, page: number, pageSize: number) {
  return NextResponse.json({
    success: true,
    message: "Success",
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }, { status: 200 });
}
