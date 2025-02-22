import os
from supertokens_python import init, InputAppInfo, SupertokensConfig
from supertokens_python.recipe import session, emailpassword
from supertokens_python.recipe.emailpassword.interfaces import RecipeInterface, SignUpOkResult
from typing import Dict, Any
from ..mongodb import users_collection
from ..models import UserCollection

def create_user_if_not_exists(user_uid):
    print(f"Attempting to create user with ID: {user_uid}")
    
    if users_collection.find_one({"_id": user_uid}):
        print(f"User {user_uid} already exists in MongoDB")
        return False
    
    try:
        new_user = UserCollection(studies=[], settings={})
        users_collection.insert_one({"_id": user_uid, **new_user.model_dump()})
        print(f"Successfully created user in MongoDB with ID: {user_uid}")
        return True
    except Exception as e:
        print(f"Failed to create user in MongoDB: {str(e)}")
        return False

def override_emailpassword_functions(original_implementation: RecipeInterface) -> RecipeInterface:
    original_sign_up = original_implementation.sign_up

    async def sign_up(
        email: str,
        password: str,
        tenant_id: str,
        session: session.SessionContainer,
        user_context: Dict[str, Any],
        should_try_linking_with_session_user: bool = False
    ):
        print(f"Sign up attempt for email: {email}")
        
        try:
            result = await original_sign_up(
                email=email,
                password=password,
                tenant_id=tenant_id,
                session=session,
                user_context=user_context,
                should_try_linking_with_session_user=should_try_linking_with_session_user
            )
            
            print(f"SuperTokens sign up result type: {type(result)}")
            
            if isinstance(result, SignUpOkResult):
                print(f"Successful sign up, got user ID: {result.user.id}")
                create_user_if_not_exists(result.user.id)
            else:
                print(f"Sign up result not OK: {type(result)}")
            
            return result
            
        except Exception as e:
            print(f"Error during sign up process: {str(e)}")
            raise

    original_implementation.sign_up = sign_up
    return original_implementation

def init_supertokens():
    auth_env = os.getenv("AUTH")

    if auth_env == "production":
        api_domain = os.getenv("PROD_API_DOMAIN")
        website_domain = os.getenv("PROD_WEBSITE_DOMAIN")
        connection_uri = os.getenv("PROD_CONNECTION_URI")

        if not all([api_domain, website_domain, connection_uri]):
            raise ValueError("Missing required production environment variables")
    else:
        api_domain = "http://127.0.0.1:8000"
        website_domain = "http://localhost:4000"
        connection_uri = "localhost:3567"

    init(
        app_info=InputAppInfo(
            app_name="symbiont",
            api_domain=api_domain,
            website_domain=website_domain,
            api_base_path="/auth",
            website_base_path="/auth",
        ),
        supertokens_config=SupertokensConfig(connection_uri=connection_uri),
        framework="fastapi",
        recipe_list=[
            session.init(
                expose_access_token_to_frontend_in_cookie_based_auth=True,
                cookie_secure=True,
                cookie_same_site="lax",
            ),
            emailpassword.init(
                override=emailpassword.InputOverrideConfig(
                    functions=override_emailpassword_functions
                ),
            ),
        ],
        mode="wsgi",
    )