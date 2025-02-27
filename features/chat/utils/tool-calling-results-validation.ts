interface GeospatialAnalysisResult {
  functionType?: string; // Optional properties to match ToolCallingMessageResults
  layerName?: string;
  legendConfig?: string;
  urlFormat?: string;
  mapStats?: any;
  uhiMetrics?: any;
}

export function validateToolCallingResults(
  messageResults: ToolCallingMessageResults
): Record<string, boolean> {
  const validationResults: Record<string, boolean> = {};

  // Validate geospatialAnalysis
  if (messageResults.geospatialAnalysis) {
    const { functionType, layerName, legendConfig, urlFormat } =
      messageResults.geospatialAnalysis;
    validationResults.geospatialAnalysis =
      !!functionType && !!layerName && !!legendConfig && !!urlFormat;
  } else {
    validationResults.geospatialAnalysis = false;
  }

  if (messageResults.geospatialData) {
    const { urlFormat, layerName, legendConfig } =
      messageResults.geospatialData;
    validationResults.geospatialData =
      !!urlFormat && !!layerName && !!legendConfig;
  } else {
    validationResults.geospatialData = false;
  }

  if (messageResults.citationSources) {
    // Validate citationSources
    validationResults.citationSources = Array.isArray(
      messageResults.citationSources
    );
  } else {
    validationResults.citationSources = false;
  }

  // Validate draftedReport
  if (messageResults.draftedReport) {
    validationResults.draftedReport =
      !!messageResults.draftedReport && !!messageResults.reportFileName; // Report file name must exist too
  } else {
    validationResults.draftedReport = false;
  }

  if (messageResults.boundingBoxes) {
    const { layerName } = messageResults.boundingBoxes;
    validationResults.boundingBoxes = !!layerName;
  } else {
    validationResults.boundingBoxes = false;
  }

  return validationResults;
}
