"""Custom client handling, including OptimizeStream base class."""

import requests
from pathlib import Path
from typing import Any, Dict, Optional, Union, List, Iterable

from singer_sdk.streams import Stream

# load GA libs
from googleapiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials

class OptimizeStream(Stream):
    """Stream class for Optimize streams."""

    def get_records(self, context: Optional[dict]) -> Iterable[dict]:
        """Return a generator of row-type dictionary objects.

        The optional `context` argument is used to identify a specific slice of the
        stream if partitioning is required for the stream. Most implementations do not
        require partitioning and should ignore the `context` argument.
        """
         
        # tap config
        config = self._tap.config
            
        credentials = self.getCredentials(config['service_account'])

        return self.getData(credentials=credentials, 
                            view_id=config['view_id'],
                            start_date=config['start_date'])


    def getData(self, credentials: ServiceAccountCredentials, 
                view_id: int,
                start_date: str, 
                end_date: str  = 'today') ->  Iterable[Dict]:
        # Build the service object.
        analytics = build('analyticsreporting', 'v4', credentials=credentials)
        response = analytics.reports().batchGet(
            body={
                'reportRequests': [
                {
                    'viewId': view_id,
                    'dateRanges': [{'startDate': start_date, 'endDate': end_date}],
                    'metrics': [{'expression': 'ga:sessions'}],
                    'dimensions': [
                        {'name': 'ga:experimentId'},
                        {'name': 'ga:experimentName'}, 
                        {'name': 'ga:experimentCombination'}
                    ]
                }]
            }
        ).execute()
        report = response.get('reports')[0]
        keys = report['columnHeader']['dimensions']
        
        data = []
        for row in report['data']['rows']:

            # transform result to something useful
            row_data = {key: row['dimensions'][index] for index, key in enumerate(keys)}

            yield {
                'view_id': int(view_id),
                'experiment_id': row_data['ga:experimentId'],
                'variant_id': int(row_data['ga:experimentCombination'].split(':')[1]),
                'experiment_description': row_data['ga:experimentName']
                }


    def getCredentials(self, service_account: str) -> ServiceAccountCredentials:
        scopes = ['https://www.googleapis.com/auth/analytics.readonly']
        return ServiceAccountCredentials.from_json_keyfile_name(service_account, scopes)
