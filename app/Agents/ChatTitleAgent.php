<?php

namespace App\Agents;

use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

#[MaxTokens(64)]
class ChatTitleAgent implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return <<<'INSTRUCTIONS'
You generate short, clear chat titles.
Always return a concise title only.
Never include quotes, prefixes, or trailing punctuation.
INSTRUCTIONS;
    }

    public function tools(): iterable
    {
        return [];
    }
}
