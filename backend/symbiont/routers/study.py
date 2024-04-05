from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from ..models import CreateStudyRequest
from firebase_admin import firestore
from ..utils.db_utils import StudyService
from datetime import datetime
from ..models import Study, Chat
from ..utils.db_utils import UserService
from .. import logger
import time
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#       USER STUDIES
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


router = APIRouter()


class StudyResponse(BaseModel):
    message: str
    status_code: int
    studies: Optional[List[Dict[str, Any]]]


@router.get("/get-current-study")
async def get_current_study(studyId: str, request: Request):
    s = time.time()
    logger.info("Getting current study")
    user_uid = request.state.verified_user["user_id"]
    db = firestore.client()
    user_studies = (
        db.collection("users").document(user_uid).get().to_dict().get("studies")
    )
    # TODO fix type error
    if studyId not in user_studies:
        logger.error("User does not have access to this study.")
        return JSONResponse(
            status_code=403,
            content={"message": "User does not have access to this study."},
        )
    study = db.collection("studies").document(studyId).get().to_dict()
    elapsed = time.time() - s
    logger.info(f"Getting current study took {elapsed} seconds")
    return {"study": study, "status_code": 200}


@router.get("/get-user-studies")
async def get_user_studies(request: Request):
    user_uid = request.state.verified_user["user_id"]
    # TODO fix pattern for returning data, cf. other routers
    try:
        db = firestore.client()
        studies_ref = db.collection("studies")
        query = studies_ref.where("userId", "==", user_uid)
        studies = query.stream()
        # Create a list of dictionaries, each containing the studyId and the study's data
        studies_data = [
            {"id": study.id, **(study.to_dict() or {})} for study in studies
        ]
        return {"studies": studies_data}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "message": "An error occurred while fetching user studies.",
                "details": str(e),
            },
        )


@router.post("/create-study")
async def create_study(study: CreateStudyRequest, request: Request):
    user_uid = request.state.verified_user["user_id"]

    new_study = Study(
        name=study.name,
        description=study.description,
        userId=user_uid,
        image=study.image,
        createdAt=str(datetime.now()),
        resources=[],
        chat=Chat(),
    )
    try:
        db = firestore.client()
        # Create a new document for the study
        study_doc_ref = db.collection("studies").document()
        study_doc_ref.set(new_study.model_dump())
        study_id = study_doc_ref.id

        # Get the user document and update the studies array
        user_doc_ref = db.collection("users").document(user_uid)
        user_doc = user_doc_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_studies = user_data.get("studies", [])
            user_studies.append(study_id)
            user_doc_ref.update({"studies": user_studies})
        else:
            # If the user does not exist, create a new document with the study
            user_doc_ref.set({"studies": [study_id]})

        return {"message": "Study created successfully", "study": study.model_dump()}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "message": "An error occurred while creating the study.",
                "details": str(e),
            },
        )


@router.delete("/delete-study")
async def delete_study(studyId: str, request: Request):
    user_uid = request.state.verified_user["user_id"]
    user_service = UserService(user_uid)

    study_service = StudyService(request.state.verified_user["user_id"], studyId)
    study_ref = study_service.get_document_ref()
    if study_ref is None:
        raise HTTPException(status_code=404, detail="No such document!")
    study_ref.delete()
    user_service.remove_study_from_user(studyId)
    return {"message": "Study deleted successfully", "status_code": 200}


@router.get("/get-study")
async def get_study(studyId: str, request: Request):
    # user_uid = request.state.verified_user["user_id"]
    # study_ref = get_document_ref("studies", "userId", user_uid, studyId)
    # if study_ref is None:
    # raise HTTPException(status_code=404, detail="No such document!")
    # study = study_ref.get()
    # if study.exists:
    # return {"study": study.to_dict()}
    return {"study": "study"}
