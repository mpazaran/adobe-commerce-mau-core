<?php

namespace Freedom\Core\Api;

class FileUploaderInterface {

    public function uploadChunk();

    public function generateId();

}
