import os
import json
from flask import Flask, request, jsonify
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

app = Flask(__name__)

# --- Helper function for API client setup ---
def get_gbp_service():
    """Initializes and returns the authenticated GBP API client."""
    try:
        service_account_info = json.loads(os.environ.get('GOOGLE_SERVICE_ACCOUNT_KEY_JSON'))
        credentials = Credentials.from_service_account_info(
            service_account_info,
            scopes=['https://www.googleapis.com/auth/business.businessinformation']
        )
        return build('mybusinessbusinessinformation', 'v1', credentials=credentials)
    except Exception as e:
        print(f"Error authenticating: {e}")
        return None

# --- API Endpoints ---
@app.route('/api/locations', methods=['GET'])
def list_locations():
    """Fetches all locations and their services for a given account."""
    gbp_service = get_gbp_service()
    if not gbp_service:
        return jsonify({"error": "Authentication failed"}), 500

    account_id = os.environ.get('GBP_ACCOUNT_ID') # Store this in Vercel secrets
    if not account_id:
        return jsonify({"error": "GBP_ACCOUNT_ID not set"}), 500

    try:
        # Get all locations for the account
        locations_response = gbp_service.accounts().locations().list(
            parent=f'accounts/{account_id}'
        ).execute()
        locations = locations_response.get('locations', [])

        # For each location, fetch its services
        for loc in locations:
            services_response = gbp_service.locations().getServiceList(
                name=f"{loc['name']}/serviceList"
            ).execute()
            loc['services'] = services_response.get('serviceItems', [])

        return jsonify(locations)
    except HttpError as err:
        return jsonify({"error": f"API Error: {err.resp.status} - {err.content.decode()}"}), err.resp.status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-services', methods=['POST'])
def update_services():
    """Updates services for a specific location."""
    data = request.json
    location_id = data.get('locationId')
    services = data.get('services')

    if not location_id or not services:
        return jsonify({"error": "Missing locationId or services in request"}), 400

    gbp_service = get_gbp_service()
    if not gbp_service:
        return jsonify({"error": "Authentication failed"}), 500

    try:
        service_list_body = {"serviceItems": services}
        gbp_service.locations().updateServiceList(
            name=f'locations/{location_id}/serviceList',
            body=service_list_body
        ).execute()

        return jsonify({"message": "Services updated successfully"})
    except HttpError as err:
        return jsonify({"error": f"API Error: {err.resp.status} - {err.content.decode()}"}), err.resp.status
    except Exception as e:
        return jsonify({"error": str(e)}), 500
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load environment variables
try:
    SERVICE_ACCOUNT_KEY_JSON = json.loads(os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY_JSON"))
    GBP_ACCOUNT_ID = os.environ.get("GBP_ACCOUNT_ID")
except (json.JSONDecodeError, TypeError) as e:
    print(f"Error loading environment variables: {e}")
    # Handle the error appropriately

def get_pending_invitation_name():
    """Lists all pending invitations for the business profile."""
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_KEY_JSON,
        scopes=['https://www.googleapis.com/auth/business.manage']
    )

    try:
        service = build('mybusinessaccountmanagement', 'v1', credentials=credentials)
        
        # This API call requires the account ID, not the location ID
        invitations_response = service.accounts().invitations().list(
            parent=f'accounts/{GBP_ACCOUNT_ID}'
        ).execute()

        invitations = invitations_response.get('invitations', [])
        if not invitations:
            print("No pending invitations found.")
            return None
        
        # Return the name of the first pending invitation
        return invitations[0].get('name')

    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

# Example usage
invitation_name = get_pending_invitation_name()
print(f"Found pending invitation name: {invitation_name}")
def accept_invitation(invitation_name):
    """Accepts a specific pending invitation."""
    if not invitation_name:
        print("No invitation name provided to accept.")
        return

    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_KEY_JSON,
        scopes=['https://www.googleapis.com/auth/business.manage']
    )

    try:
        service = build('mybusinessaccountmanagement', 'v1', credentials=credentials)
        
        # The API call to accept the invitation takes the name as a parameter
        service.accounts().invitations().accept(
            name=invitation_name,
            body={}
        ).execute()

        print(f"Successfully accepted invitation: {invitation_name}")
        return True

    except HttpError as error:
        print(f"An error occurred while accepting: {error}")
        return False

# Example usage
if invitation_name:
    success = accept_invitation(invitation_name)
    if success:
        print("Service account is now a manager of the business profile!")
