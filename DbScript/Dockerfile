FROM mcr.microsoft.com/mssql-tools

WORKDIR /DbScript

COPY . .

RUN chmod +x /DbScript/init.sh

ENTRYPOINT ["/DbScript/init.sh"]