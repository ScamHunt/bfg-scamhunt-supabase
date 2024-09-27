export interface RmseResponse {
    success: boolean;
    message?: string;
    data?: Data[];
}

export interface Data {
    url_id: string;
    url: string;
    screenshot_url: string;
    webrisk_evaluation: WebriskEvaluation;
}

export interface WebriskEvaluation {
    scores: { threat_type: string; confidence_level: string }[];
}
