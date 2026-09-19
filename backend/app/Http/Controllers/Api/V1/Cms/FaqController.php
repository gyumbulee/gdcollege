<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\FaqRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Faq;
use App\Services\AuditLogger;

class FaqController extends Controller
{
    use ApiResponse;

    public function publicIndex()
    {
        return $this->success(Faq::orderBy('category')->orderBy('sort_order')->get());
    }

    public function index()
    {
        return $this->success(Faq::orderBy('category')->orderBy('sort_order')->get());
    }

    public function store(FaqRequest $request, AuditLogger $audit)
    {
        $faq = Faq::create($request->validated());
        $audit->log('cms.faqs.create', $faq, null, $faq->only(['question']));

        return $this->success($faq, 'FAQ created.', 201);
    }

    public function update(FaqRequest $request, Faq $faq, AuditLogger $audit)
    {
        $old = $faq->only(['question', 'answer']);
        $faq->update($request->validated());
        $audit->log('cms.faqs.update', $faq, $old, $faq->only(['question', 'answer']));

        return $this->success($faq, 'FAQ updated.');
    }

    public function destroy(Faq $faq, AuditLogger $audit)
    {
        $audit->log('cms.faqs.delete', $faq, $faq->only(['question']), null);
        $faq->delete();

        return $this->success([], 'FAQ deleted.');
    }
}
