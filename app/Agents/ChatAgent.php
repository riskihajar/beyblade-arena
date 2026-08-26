<?php

namespace App\Agents;

use App\Ai\Tools\ChartRelay;
use App\Ai\Tools\DatabaseQueryTool;
use App\Ai\Tools\DatabaseSchemaTool;
use App\Ai\Tools\RelayToolBridge;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Laravel\Ai\Providers\Tools\WebSearch;
use Prism\Relay\Exceptions\RelayException;

#[MaxTokens(4096)]
#[MaxSteps(10)]
class ChatAgent implements Agent, Conversational, HasTools
{
    use Promptable, RemembersConversations;

    protected bool $enableWebSearch = false;

    public function withWebSearch(bool $enabled): self
    {
        $this->enableWebSearch = $enabled;

        return $this;
    }

    public function instructions(): string
    {
        return <<<'instructions'
You are a helpful AI assistant with access to the application database and chart generation capabilities. You should be friendly, concise, and accurate in your responses.
Always use the full conversation context and remember prior user details and decisions.
If the current request depends on earlier messages, explicitly incorporate that history.
When appropriate, you can ask clarifying questions to better help the user.

When answering questions about application data:
1. First use the database-schema tool to understand the relevant table structures and relationships.
2. Then use the database-query tool to execute appropriate SELECT queries.
3. Summarize the results clearly and concisely for the user.
4. Only use read-only queries (SELECT). Never attempt to modify data.
5. When joining tables, look at column names to identify foreign key relationships (e.g. user_id relates to users.id).

When asked to visualize or chart data:
1. First query the data using the database tools.
2. Then use the appropriate chart generation tool (e.g. generate_pie_chart, generate_bar_chart, generate_line_chart) to create a visualization.
3. Pass the data as a JSON string to the chart tool's data parameter.
4. Include a descriptive title for the chart.
5. Present the chart along with a brief textual summary of the data insights.
instructions;
    }

    protected function maxConversationMessages(): int
    {
        return 200;
    }

    public function tools(): iterable
    {
        $tools = [
            new DatabaseSchemaTool,
            new DatabaseQueryTool,
        ];

        // Add chart tools from MCP server via Relay
        try {
            $relay = new ChartRelay('chart');
            foreach ($relay->tools() as $relayTool) {
                $tools[] = new RelayToolBridge($relayTool);
            }
        } catch (RelayException $e) {
            Log::debug('Chart MCP server unavailable: '.$e->getMessage());
        } catch (\Throwable $e) {
            Log::debug('Chart tools failed to load: '.$e->getMessage());
        }

        if ($this->enableWebSearch) {
            $tools[] = new WebSearch;
        }

        return $tools;
    }
}
