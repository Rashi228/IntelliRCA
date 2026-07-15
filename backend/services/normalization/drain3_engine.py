from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig

class Drain3Engine:
    def __init__(self):
        config = TemplateMinerConfig()
        config.load("") # load default config
        self.template_miner = TemplateMiner(config=config)
        
    def extract_template(self, log_message: str):
        result = self.template_miner.add_log_message(log_message)
        return {
            "template": result["template_mined"],
            "cluster_id": result["cluster_id"],
            "variables": self.template_miner.extract_parameters(result["template_mined"], log_message)
        }

drain3_engine = Drain3Engine()
