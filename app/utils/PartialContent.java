package utils;
/*
Copied from https://gist.github.com/1781977.
 */

import org.jboss.netty.handler.stream.ChunkedFile;
import play.exceptions.UnexpectedException;
import play.libs.MimeTypes;
import play.mvc.Http.Header;
import play.mvc.Http.Request;
import play.mvc.Http.Response;
import play.mvc.results.Result;

import java.io.File;
import java.io.RandomAccessFile;

public class PartialContent extends Result {

    private final File file;
    private final String fileName;

    public PartialContent(final File file, final String fileName) {
        this.file = file;
        this.fileName = fileName;
    }

    @Override
    public void apply(final Request request, final Response response) {
        try {
            response.status = 206;
            Header rangeHeader = request.headers.get("range");
            String rangeValue = rangeHeader.value().trim()
                    .substring("bytes=".length());
            long fileLength = this.file.length();
            long start, end;
            if (rangeValue.startsWith("-")) {
                end = fileLength - 1;
                start = fileLength - 1
                        - Long.parseLong(rangeValue.substring("-".length()));
            } else {
                String[] range = rangeValue.split("-");
                start = Long.parseLong(range[0]);
                end = range.length > 1 ? Long.parseLong(range[1])
                        : fileLength - 1;
            }
            if (end > fileLength - 1) {
                end = fileLength - 1;
            }
            if (start <= end) {
                long contentLength = end - start + 1;
                response.setHeader("Content-Length", contentLength + "");
                response.setHeader("Content-Range", "bytes " + start + "-"
                        + end + "/" + fileLength);
                response.setHeader("Content-Type",
                        MimeTypes.getContentType(this.fileName));
                RandomAccessFile raf = new RandomAccessFile(this.file, "r");
                response.direct = new ChunkedFile(raf, start, contentLength,
                        8192);
            }
        } catch (Exception e) {
            throw new UnexpectedException(e);
        }
    }
}